/**
 * Prepare a learning class repository to support versioning.
 * A .tags directory is created as a sibling of each .lclass.
 * @param path The learning class repository path.
**/
def path = '/temp/LClasses'

versioningLClassRepository (path)

def versioningLClassRepository (String path) {
    def fPath = new File (path)
    def files = fPath.listFiles()
    for (file in files) {
        if (file.name == '.lClass') {
            def parentPath =  file.parentFile.path 
            def tagsPath = parentPath + '/.tags'
            def tagsFile = new File (tagsPath)
            tagsFile.mkdir()
            println 'creating tags:' + tagsFile
        }
        else versioningLClassRepository (file.path)
    }
}