import java.text.MessageFormat
import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.NamedNodeMap
import org.w3c.dom.Node
import org.w3c.dom.NodeList

/**
 * Formats all xml lObjects in a learning object repository.
 * @param root The root of the learning class repository.
**/

def root = '/temp/'

formatAllObjects (root)

def void formatAllObjects (String root) {
    def contents = getSchemas (root)
    for (schema in schemas)
        formatLObject ('file://'+ schema, ' ', ' ')
}

def void formatLObject (uri, prefix, namespace) {
   document = loadDocument (uri)
   //document = setTargetNamespace (document, prefix, namespace)
   xml = formatXML (document)
   saveDocument (uri, xml)
   
   println 'lObject ' + uri + ' succsessfully formatted'
}


def Document setTargetNamespace (Document document,
                                 String prefix,
                                 String namespace) {
   def node   = document.getDocumentElement ()
   def attrs  = node.getAttributes ()
   def nsAttr = attrs.getNamedItem ('targetNamespace')
   def oldNS  = nsAttr.getTextContent ()
   nsAttr.setNodeValue (namespace)
            
   def found = false
   def index = 0
   while (!found && index < attrs.getLength ()) {
       found = attrs.item (index).getNodeValue ().equals (oldNS)
       index++
   }
   if (found) {
     def attr = attrs.item (index - 1)
     def oldPrefix = attr.getLocalName ()
     node.removeAttribute (attr.getNodeName ())
     node.setAttribute (prefix, namespace)
     node.setAttributeNS (document.getNamespaceURI (), 'xmlns:' + prefix, namespace)
     replacePrefix (node, oldPrefix, prefix)
   }
   return document
}

def void replacePrefix (Node node,
                        String oldPrefix,
                        String prefix) {
   def nodePrefix = node.getPrefix ()
   if (oldPrefix.equals (nodePrefix)) node.setPrefix (prefix)
   if (node.hasAttributes ()) {
       def attrs = node.getAttributes ()
       for (def index = 0; index < attrs.getLength (); index++) {
           def attr = attrs.item (index)
           def attrPrefix = attr.getPrefix ()
           if (oldPrefix.equals (attrPrefix)) attr.setPrefix (prefix)
           try {
                def attrValue = attr.getNodeValue ()
                def tokens    = attrValue.split (":")
                if (tokens[0].equals (oldPrefix))
                   attr.setNodeValue (prefix + ":" + tokens[1])
           } catch (Exception e) {}
       }
   }
   if (node.hasChildNodes ()) {
       def children = node.getChildNodes () 
       for (def index = 0; index < children.getLength (); index++)
          replacePrefix (children.item (index), oldPrefix, prefix)         
   }      
}

def String formatXML (Document document) {
    def node = document.getDocumentElement ()
    return formatXMLNode (node, 0)
}

def String formatXMLNode (Node node, int indent) {
    def nodeType = node.getNodeType ()
    if (nodeType == Node.TEXT_NODE) return formatText (node, indent)
    if (nodeType == Node.ELEMENT_NODE) {
       def formats = [
                       '{4}<{1}/>\n',
                       '{4}<{1}>\n{3}{4}</{1}>\n',
                       '{4}<{1}{2}/>\n',
                       '{4}<{1}{2}>\n{3}{4}</{1}>\n',
                       '{4}<{0}:{1}/>\n',
                       '{4}<{0}:{1}>\n{3}{4}</{0}:{1}>\n',
                       '{4}<{0}:{1}{2}/>\n',
                       '{4}<{0}:{1}{2}>\n{3}{4}</{0}:{1}>\n'
                     ]
                     
       def prefix      = node.getPrefix ()
       def name        = node.getLocalName ()             
       def prefixYesNo = (prefix != null)? 1 : 0
       def attrYesNo   = node.hasAttributes ()? 1 : 0
       def childYesNo  = node.hasChildNodes ()? 1 : 0
       def elementType = 4 * prefixYesNo + 2 * attrYesNo + childYesNo  
                    
       def xmlAttrs    = formatXMLAttributes (node, indent)
       def xmlChildren = formatXMLChindren (node, indent+1)
       def strIndent   = getIndent (indent)
       def format      = (indent > 2)? formats[elementType] : (formats[elementType] + '\n')
       return MessageFormat.format (format, prefix, name, xmlAttrs, xmlChildren, strIndent)
    }
    return ''
}

def String formatXMLChindren (Node node, int indent) {    
    if (node.hasChildNodes ()) {
        def xml = new StringBuffer ()           
        def children = node.getChildNodes ()
        for (def index = 0; index < children.getLength (); index ++) {
             def xmlNode = formatXMLNode (children.item (index), indent +1)
             if (xmlNode.trim ().length () > 0) xml.append (xmlNode)               
         }
         return xml.toString ()
    }
    return ''
}

def String formatXMLAttributes (Node node, int indent) {
    if (node.hasAttributes ()) {
        def xml = new StringBuffer ()
        def inColumnPrefixedAttrFormat = "\n  {3} {0}:{1}=''{2}''"
        def inColumnSimpleAttrFormat   = "\n  {3} {1}=''{2}''"
        def inLinePrefixedAttrFormat   = " {0}:{1}=''{2}''"
        def inLinesimpleAttrFormat     = " {1}=''{2}''"
            
        NamedNodeMap attributes = node.getAttributes ()
        for (def index = 0; index < attributes.getLength (); index ++) {
             def attribute = attributes.item (index)
             def prefix    = attribute.getPrefix ()
             def name      = attribute.getLocalName ()
             def value     = attribute.getNodeValue ()
                
             def inColumnAttrFormat = (prefix == null)? inColumnSimpleAttrFormat : inColumnPrefixedAttrFormat
             def inLineAttrFormat   = (prefix == null)? inLinesimpleAttrFormat : inLinePrefixedAttrFormat
             def attrFormat         = ((attributes.getLength () > 3)? inColumnAttrFormat : inColumnAttrFormat).toString ()
             def strIndent          = getIndent (indent)
             xml.append (MessageFormat.format (attrFormat, prefix, name, value, strIndent))
        }
        return xml.toString ()
    }
    return ''
}
    
def String formatText (Node node, int indent) {
    def blockSize  = 80
    def xml = new StringBuffer ()
    def text = node.getTextContent ().trim ()
    def strIndent = getIndent (indent) 
    while (text.length () > 0) {
        index = ((text.length () > blockSize)? blockSize :  text.length ()) - 1
        index = text.indexOf (' ', index)
        index = (index > 0)? index : text.length ()
        xml.append (strIndent + text.substring (0, index) + '\n')
        text = (text.substring (index)).trim ()           
    }       
    return xml.toString ()
}

def String getIndent (int indent) {
    def indentBuffer = new StringBuffer ()
    for (def index = 0; index < indent; index ++) 
         indentBuffer.append (' ')
    return indentBuffer.toString ()
}
    
def Document loadDocument (String uri) {
   domFactory = DocumentBuilderFactory.newInstance ()
   domFactory.setNamespaceAware (true)
   builder = domFactory.newDocumentBuilder ()
   return builder.parse (uri)
}

def void saveDocument (String uri, String xml) {
   def xmlFile = new File ((new URL (uri)).getFile ())
   def xmlWrt = new FileWriter (xmlFile)
   xmlFile.createNewFile ()
   xmlWrt.write (addPreamble (xml))
   xmlWrt.flush ()
   xmlWrt.close ()
}

def String addPreamble (String xml) {
    preamble = '''<?xml version='1.0' encoding='UTF-8'?>'''
    return "$preamble\n\n$xml"
}

def List getContents (String rootPath) {
    def schemas = [] 
    def rootFile = new File (rootPath)
    def files = rootFile.listFiles ()
    for (file in files) {
        if (file.isDirectory ()) 
            schemas.addAll (getSchemas (file.getPath ()))
        else if (file.getName ().endsWith ('xml'))
            schemas.add (file.getPath ().replace ('\\', '/'))
    }
    return schemas
}