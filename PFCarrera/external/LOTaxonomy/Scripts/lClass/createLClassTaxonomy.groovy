/**
 * Creates the learning class taxonomy.
 * @param path The root path.
**/
def path = '/temp/LClasses'
def txPath  = '/temp/lClasses.txt'

createLClassTaxonomy (path, txPath)

def createLClassTaxonomy (String base, String txPath) {
  def lPaths = getLPaths (base)
  def lClasses = getLClasses (lPaths, base)
  saveFile (txPath, lClasses)
  
  println 'lClass taxonomy successfully created in ' + txPath
}

def void  saveFile (String txPath, List lClasses) {
  def txFile = new File (txPath)
  def txFileWrt = new PrintWriter (new FileWriter (txFile))
  txFile.createNewFile ()
  lClasses.collect {
     txFileWrt.println it
  }
  txFileWrt.flush ()
  txFileWrt.close ()
}

def List getLClasses (List lPaths, String base) {
  def lClasses = []
  for (lPath in lPaths) {
     def relPath = lPath.substring (base.length () + 1)
     lClasses += relPath.replace (File.separator , '.')
  }
  return lClasses
}

def List getLPaths (String path) {
  def file = new File (path)
  if (file.getName () == '.lClass') {
    return [file.getParentFile ().getPath ()]
  }
  else {
     def files = file.listFiles ()
     def lPaths = []
     files.collect {
        lPaths.addAll (getLPaths (it.getPath ()))
     }
     return lPaths
  }
}