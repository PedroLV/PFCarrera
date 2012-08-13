/**
 * Prepare a learning object repository to support versioning.
 * A .tags directory is created as a sibling of each .lObject.
 * @param path The learning class repository path.
**/
def path = '/temp/LObjects'

versioningLObjectRepository (path)

def versioningLObjectRepository (String path) {
    def fPath = new File (path)
    def files = fPath.listFiles()
    for (file in files) {
        if (file.name == '.lObject') {
            def parentPath =  file.parentFile.path 
            def tagsPath = parentPath + '/.tags'
            def tagsFile = new File (tagsPath)
            tagsFile.mkdir()
            println 'creating tags:' + tagsFile
        }
        else versioningLObjectRepository (file.path)
    }
}