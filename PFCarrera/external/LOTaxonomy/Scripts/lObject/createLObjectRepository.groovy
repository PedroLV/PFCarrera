/**
 * Creates a learning object repository.
 * @param base The base of learning object repository.
 * @param txPath The path of learning class taxonomy.
 * @param host The host for learning class namespace.
**/
def base = '/temp/LObjects/'
def host = 'http://ltcs.uned.es/'
def path = '/temp/LClassTaxonomy.txt'

createLObjectRepository (base, host, path)

def createLObjectRepository (String base, String host, String txPath) {
     lClasses = loadLClassTaxonomy (txPath) 
     for (lClass in lClasses) {
         lPath = getLPath (lClass)
         createLObject (base, lPath, host)
     }
}

def createLObject (String base,
                   String lPath,
                   String host) {
    createManifest  (base, lPath, '.lObject/')
    createContent   (base, lPath, '.lObject/content/', host) 
    createMetadata  (base, lPath, '.lObject/metadata/', host) 
    createResources (base, lPath, '.lObject/resource/')

    println 'lObject ' + lPath + ' successfully created'
}

def void createManifest (String base,
                         String lPath,
                         String rPath) {
    path = lPath + rPath
    id   = getId (path)
    xmlManifest = """<?xml version='1.0'?>

<manifest id='${id}.manifest.xml'
          version='1.0'>
    <lObject id='${id}'
            version='1.0'>
           <label>${id}</label>
           <description/>
    </lObject>
    <lClass id='${id}'
            version='1.0'/>
    <views>
        <view name='default'>
            <scripts>
                <script id=''/>
                <script id=''/>
            </scripts>
            <resources>
                <resource key='' id=''/>
                <resource key='' id=''/>
            </resources>
        </view>
    </views>
</manifest>
"""
    manifest = createFile (base, path, 'manifest.xml')
    fileWtr  = new FileWriter (manifest)
    fileWtr.write (xmlManifest)
    fileWtr.flush ()
    fileWtr.close ()
}

def void createContent (String base, 
                        String lPath,
                        String rPath,
                        String host) { 
    path       = lPath + rPath
    location   = base + lPath 
    namespace  = getNamespace (host, lPath)
    name       = getName (lPath)
    namelc     = name.toLowerCase ()
    xmlContent = """<?xml version='1.0'?>

<ns:${namelc}
    xmlns:ns='${namespace}'
    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
    xsi:schemaLocation='${namespace} ./../../../../../../..${location}.lClass/schema/${name}.xsd'>

</ns:$namelc>
"""
    file = createFile (base, path, name + '.xml')
    fileWtr = new FileWriter (file)
    fileWtr.write (xmlContent)
    fileWtr.flush ()
    fileWtr.close () 
}

def void createMetadata (String base, 
                         String lPath,
                         String rPath,
                         String host) {    
    path       = lPath + rPath
    location   = base + lPath 
    namespace  = getNamespace (host, lPath)
    xmlGMData  = """<?xml version='1.0'?>

<ns:metadata
    xmlns:ns='${namespace}'
    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
    xsi:schemaLocation='${namespace} ./../../../../../../..${location}.lClass/schema/general.mdata.xsd'>

</ns:metadata>
"""
    xmlSMData  = """<?xml version='1.0'?>

<ns:metadata
    xmlns:ns='${namespace}'
    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
    xsi:schemaLocation='${namespace} ./../../../../../../..${location}.lClass/schema/specific.mdata.xsd'>

</ns:metadata>
"""
    gMData  = createFile (base, path, 'general.mdata.xml')
    fileWtr = new FileWriter (gMData)
    fileWtr.write (xmlGMData)
    fileWtr.flush ()
    fileWtr.close ()   
    
    sMData  = createFile (base, path, 'specific.mdata.xml')
    fileWtr = new FileWriter (sMData)
    fileWtr.write (xmlSMData)
    fileWtr.flush ()
    fileWtr.close () 
}

def void createResources (String base,
                          String lPath,
                          String rPath) {
    resources = []
    createFiles (base, lPath + rPath, resources)
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
      if (token == '.lObject')
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
      if (token == '.lObject') return namespace.substring (0, namespace.length () -1)
      namespace += token.toLowerCase ()  +  '/' 
    }
    return namespace.substring (0, namespace.length () -1)
}

def String getId (String lPath) {
    def id = ''           
    tokens = lPath.split ('/')                         
    for (token in tokens) {
      if (token != '.lObject')
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