import java.net.URL;
import java.text.MessageFormat;
import albatros.rendering.learningClass.Schema;

/**
 * Creates a learning object content.
 * @param prefix The prefix of the namespace.
 * @param namespace The namespace.
 * @param location The uri of xml schema.
**/

def prefix    = 'pf'
def namespace = 'http://foo.com'
def location  = './bar/schema.xsd'
createLObjectContent (prefix, namespace, location)

def void createLObjectContent (prefix, namespace, nsLocation) {
    schema = new Schema (new URL (location))
    root   = schema.getReference ()
    xml    =  getXml (prefix, schema)
    xml    = addPreamble (prefix, namespace, location, xml)
    saveFile (prefix, xml)
}

def String getXml (String prefix, Schema schema)  {
    def reference = schema.getReference ()
    return getXml (prefix, schema, reference, 0)
}
   
def String getXml (String prefix,
                   Schema schema, 
                   Object reference,
                   int indent) {
     def fullFormat   = "\n{4}<{0}:{1}{2}> {3}\n{4}</{0}:{1}>"
     def emptyFormat  = "\n{3}<{0}:{1}{2}/>"
     def simpleFormat = "\n{3}<{0}:{1}{2}/>"
     def attrFormat   = "\n   {3}{0}:{1}=''#{2}''"
        
     def xml     = new StringBuffer ()
     def element = schema.getElement (reference)
     def name    = schema.getProperty (element, "name")
     def type    = schema.getProperty (element, "type.type")
        
     def attrs    = schema.getAttributes (reference)
     def xmlAttrs = new StringBuffer ()
     for (attr in attrs) {
          def aName = schema.getProperty (attr, "name")
          def aType = schema.getProperty (attr, "type.name")
          xmlAttrs.append (MessageFormat.format (attrFormat, prefix, aName, aType, getIndent (indent)))
     }
        
     if ("Complex".equals (type)) {
        def typeVariety = (String) schema.getProperty (element, "type.contentType.type")
        if ("group".equals (typeVariety)) {
             def xmlChildren = new StringBuffer ()
             def compositor  = schema.getProperty (element, "type.contentType.compositor")
             def minOccurs   = schema.getProperty (element, "type.contentType.minOccurs")
             def maxOccurs   = schema.getProperty (element, "type.contentType.maxOccurs")
             if ("choice".equalsIgnoreCase (compositor)){}
             else {
                 def children = schema.getProperty (element, "type.contentType.children.reference")
                 def childrenMinOccurs = schema.getProperty (element, "type.contentType.children.minOccurs")
                 def childrenMaxOccurs = schema.getProperty (element, "type.contentType.children.maxOccurs")
                 for (Object child: children)
                        xmlChildren.append (getXml (prefix, schema, child, indent + 1))
             }
             xml.append (MessageFormat.format (fullFormat, prefix, name, xmlAttributes, xmlChildren, getIndent (indent), minOccurs, maxOccurs))
        }
        else xml.append (MessageFormat.format (emptyFormat, prefix, name, xmlAttributes, getIndent (indent)))
     }      
     else xml.append (MessageFormat.format (simpleFormat, prefix, name, xmlAttributes, getIndent (indent)))
     
     return xml.toString ()
}
    
def String getIndent (int indent) {
    def indentBuffer = new StringBuffer ()
    for (int index = 0; index < indent; index ++) 
         indentBuffer.append (' ')
    return indentBuffer.toString ()
}
    
def static void saveFile (String string, String xml) {
        System.out.println (addPreamble (xml))
}

def static String addPreamble (String prefix,
                               String namespace,
                               String location,
                               String xml) {
    def header = "<?xml version='1.0' encoding='UTF-8'?>\n\n"
    def preamble = new StringBuffer ()
    preamble.append ("  xmlns:$prefix='$location'\n")
    preamble.append ("   xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'\n")
    preamble.append ("   xsi:schemaLocation='$namespace $location'\n ")
            
    def xmlBuffer = new StringBuffer (xml.trim ())
    def offset = xml.indexOf (' ')
    xmlBuffer.insert (offset, preamble)
    xmlBuffer.insert (0, header)
    return xmlBuffer.toString ()
}