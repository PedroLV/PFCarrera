/**
 * Copy a learning object repository.
 * @param sorce The source learning object repository.
 * @param target The source learning object repository.
**/
def target = '/temp/LObjects'
def source = '/temp/old/LObjects'

copyLObjectRepository (source, target)

def copyLObjectRepository (String source, String target) {
    def sourceFile = new File (source)
    def files = sourceFile.listFiles()
    for (file in files) {
        if (file.isDirectory ())
            copyLObjectRepository (file.getPath (), target + '/' + file.getName())
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