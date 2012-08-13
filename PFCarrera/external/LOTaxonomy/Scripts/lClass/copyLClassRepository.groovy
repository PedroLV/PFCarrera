/**
 * Copy a learning class repository.
 * @param sorce The source learning class repository.
 * @param target The source learning class repository.
**/
def target = '/temp/LClasses'
def source = '/temp/old/LClasses'

copyLClassRepository (source, target)

def copyLClassRepository (String source, String target) {
    def sourceFile = new File (source)
    def files = sourceFile.listFiles()
    for (file in files) {
        if (file.isDirectory ())
            copyLClassRepository (file.getPath (), target + '/' + file.getName())
        else copyFile (file.getPath (), target + '/' +file.getName())
    }
}

def void copyFile (String sPath, String tPath) {
    
    def sFile = new File (sPath)
    def tFile = new File (tPath)
     if (sFile.getName () == 'manifest.xml') return
    try {
        def sLines = sFile.readLines()
        def tFileWtr = new FileWriter (tFile)
        for (sLine in sLines){
            tFileWtr.write (sLine)
            tFileWtr.write ('\n')    
        }
        tFileWtr.flush ()
        tFileWtr.close()
        
        println sFile.getName () + ' successfully copied'
         
    } catch (e) {
        println 'Unable to copy ' + sFile.getName () + '!'
    }   
}