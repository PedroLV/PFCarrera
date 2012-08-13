/**
 * Creates a learning class repository.
 * @param base The base of learning class repository.
 * @param txPath The path of learning class taxonomy.
 * @param host The host for learning class namespace.
**/
def base = '/temp/LClasses/'
def host = 'http://ltcs.uned.es/'
def path = '/temp/LClassTaxonomy.txt'

createLClassRepository (base, host, path)

def createLClassRepository (String base, String host, String txPath) {
     lClasses = loadLClassTaxonomy (txPath) 
     for (lClass in lClasses) {
         lPath = getLPath (lClass)
         createLClass (base, lPath, host)
     }
}

def createLClass (String base,
                  String lPath,
                  String host) {
    createManifest  (base, lPath + '.lClass/')
    createSchema    (base, lPath + '.lClass/schema/', host) 
    createMDSchemas (base, lPath + '.lClass/schema/mdata/', host) 
    createLayout    (base, lPath + '.lClass/layout/')
    createStyle     (base, lPath + '.lClass/style/')
    createScripts   (base, lPath + '.lClass/script/')
    createResources (base, lPath + '.lClass/resource/')
    
    println lPath + ' lClass successfully created'
}

def void createManifest (String base,
                         String lPath) {
    id = getId (lPath)
    xmlManifest = """<?xml version='1.0'?>

<manifest id='${id}.manifest.xml'
          version='1.0'>
    <lClass id='${id}'
            version='1.0'>
           <label>${id}</label>
           <description/>
    </lClass>
    <views>
        <view name='default'>
            <filter>
                <property name='' value=''/>
                <property name='' value=''/>
            </filter>
            <settings>
                <layout id=''/>
                <styles>
                    <style id=''/>
                    <style id=''/>
                </styles>
                <scripts>
                    <script id=''/>
                    <script id=''/>
                </scripts>
                <resources>
                    <resource key='' id=''/>
                    <resource key='' id=''/>
                </resources>
            </settings>
          </view>
    </views>
</manifest>
"""
    manifest = createFile (base, lPath, 'manifest.xml')
    fileWtr  = new FileWriter (manifest)
    fileWtr.write (xmlManifest)
    fileWtr.flush ()
    fileWtr.close ()
}

def void createSchema (String base, 
                       String lPath,
                       String host) {    
    loNS = host + 'lo'
    tgNS = getNamespace (host, lPath)
    name = getName (lPath)
    xmlSchema = """<?xml version='1.0' encoding='UTF-8'?>

<xs:schema 
  xmlns:xs='http://www.w3.org/2001/XMLSchema'
  xmlns:lo='${loNS}'
  xmlns:ns='${tgNS}'
  targetNamespace='${tgNS}'
  elementFormDefault='qualified'
  attributeFormDefault='qualified'>

</xs:schema>
"""
    file = createFile (base, lPath, name + '.xsd')
    fileWtr = new FileWriter (file)
    fileWtr.write (xmlSchema)
    fileWtr.flush ()
    fileWtr.close () 
}

def void createMDSchemas (String base, 
                          String lPath,
                          String host) {    
    loNS = host + 'lo'
    tgNS = getNamespace (host, lPath)
    name = getName (lPath)
    xmlGSchema = """<?xml version='1.0' encoding='UTF-8'?>

<xs:schema 
  xmlns:xs='http://www.w3.org/2001/XMLSchema'
  xmlns:ns='${host}lo/mdata'
  targetNamespace='${host}lo/mdata'
  elementFormDefault='qualified'
  attributeFormDefault='qualified'>

</xs:schema>
"""
    xmlSSchema = """<?xml version='1.0' encoding='UTF-8'?>

<xs:schema 
  xmlns:xs='http://www.w3.org/2001/XMLSchema'
  xmlns:ns='${tgNS}/mdata'
  targetNamespace='${tgNS}/mdata'
  elementFormDefault='qualified'
  attributeFormDefault='qualified'>

</xs:schema>
"""
    gSchema = createFile (base, lPath, 'general.mdata.xsd')
    fileWtr = new FileWriter (gSchema)
    fileWtr.write (xmlGSchema)
    fileWtr.flush ()
    fileWtr.close ()   
    
    sSchema = createFile (base, lPath, 'specific.mdata.xsd')
    fileWtr = new FileWriter (sSchema)
    fileWtr.write (xmlSSchema)
    fileWtr.flush ()
    fileWtr.close () 
}

def void createLayout (String base,
                       String lPath) {
    layouts = ['view.ftl', 'edit.ftl']
    createFiles (base, lPath, layouts)
}

def void createStyle (String base,
                      String lPath) {
    styles = ['view.css', 'edit.css']
    createFiles (base, lPath, styles)
}

def void createScripts (String base,
                        String lPath) {
    scripts = ['js', 'groovy']
    //           'groovy/lifecycle',
    //           'groovy/lifecycle/install.groovy',
    //           'groovy/lifecycle/start.groovy',
    //           'groovy/lifecycle/render.groovy',
    //           'groovy/lifecycle/stop.groovy',
    //           'groovy/lifecycle/uninstall.groovy']
    createFiles (base, lPath, scripts)
}

def void createResources (String base,
                         String lPath) {
    resources = []
    createFiles (base, lPath, resources)
}


def List createFiles (String base,
                      String lPath,
                      List names) {
    files = []
    dir = new File (base + lPath)
    dir.mkdirs ()
    for (name in names)
        files.add (createFile (base, lPath, name))
    return files
}

def File createFile (String base,
                     String lPath,
                     String name) {
    dir = new File (base + lPath)
    dir.mkdirs ()
    file = new File (base + lPath + name)
    if (name.indexOf ('.') > 0) {      
      file.createNewFile()
   }
   else  file.mkdirs()
   return file
}

def String getName (String lPath) {
    def name          
    tokens = lPath.split ('/')                         
    for (token in tokens) {
      if (token == '.lClass')
          return name
      name = token
    }
    return name
} 

def String getNamespace (String host,
                         String lPath) {
    namespace = host
    tokens = lPath.split ('/')                         
    for (token in tokens) {
      if (token == '.lClass') return namespace.substring (0, namespace.length () -1)
      namespace += token.toLowerCase ()  +  '/' 
    }
    return namespace.substring (0, namespace.length () -1)
}

def String getId (String lPath) {
    def id = ''           
    tokens = lPath.split ('/')                         
    for (token in tokens) {
      if (token != '.lClass')
          id += '.' + token
    }
    return id.substring (1).trim()
}

def String getLPath (String id) {
    def lPath = ''           
    tokens = id.split ('\\.')                         
    for (token in tokens) {
          lPath += '/' + token
    }
    return lPath.substring(1).trim() + '/'
} 

def List loadLClassTaxonomy (String txPath) {
    lClasses = []
    File txFile = new File (txPath)
    lines = txFile.readLines()
    for (line in lines)
        lClasses.add (line) 
    return lClasses
}