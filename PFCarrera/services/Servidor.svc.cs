using System;
using System.Collections.Generic;
using System.Data.Services;
using System.Data.Services.Common;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;
using System.Collections;
using PFCarrera.services.DataServiceProvider;
using System.Data.Services.Providers;
using System.IO;
using System.Text;
using System.Security.Permissions;
using System.Security;

namespace PFCarrera.services
{
    [JSONPSupportBehavior]
#if DEBUG
    [System.ServiceModel.ServiceBehavior(IncludeExceptionDetailInFaults = true)]
#endif
    public class Servidor : DSPDataService<DSPContext>
    {
        public const String STORAGE_RELATIVE_PATH = "/storage";
        protected override DSPContext CreateDataSource()
        {
            DSPContext context = new DSPContext();

            IList learningClases = context.GetResourceSetEntities("LearningClass");

            FileDescriptor fichero1 = new FileDescriptor();
            fichero1.FileURL = "/external/XSD/Check-rclass/.lClass/schema/schema.xsd";
            fichero1.FileName = "Check-rclass";
            fichero1.Description = "Learning Class Pregunta de tipo Check";

            FileDescriptor fichero2 = new FileDescriptor();
            fichero2.FileURL = "/external/LOTaxonomy/LClasses/LO/Evaluation/Question/CheckSheet/.lClass/schema/schema.xsd";
            fichero2.FileName = "CheckSheet";
            fichero2.Description = "Learning Class Question de tipo CheckSheet";


            //E:\Users\Pedro\Documents\UNED\Proyecto\LOTaxonomy\LClasses\LO\Evaluation\Question\CheckSheet\.lClass\schema
            
            learningClases.Add(fichero1);
            learningClases.Add(fichero2);

            

            return context;
        }


        #region ChangeInterceptor
        /// <summary>
        /// Captura las peticiones de grabacion de un objeto design y graba en el disco duro del servidor la petición
        /// </summary>
        /// <param name="objetoDesign"></param>
        /// <param name="operation"></param>
        [ChangeInterceptor("Design")]
        public void OnChangeDesing(Design objetoDesign, UpdateOperations operation)
        {
            //TODO por aki voy 17/04/2012
            // Authenticate
            //string[] userpw = GetCurrentUserPassword();
            //if (userpw == null ||
            //  !userpw[0].Equals("admin", StringComparison.CurrentCultureIgnoreCase) ||
            //  !userpw[1].Equals("pw"))
            //{

            //    HttpContext.Current.Response.
            //      AddHeader("WWW-Authenticate", "Basic realm=\"Northwind\"");
            //    throw new DataServiceException(401, "Unauthorized");
            //}
            
            StringBuilder resultText = new StringBuilder();
            String folderPath = HttpContext.Current.Server.MapPath(Servidor.STORAGE_RELATIVE_PATH);
            String fileName = Path.Combine(folderPath, objetoDesign.FileName.EndsWith(".design") ? objetoDesign.FileName :  objetoDesign.FileName + ".design");
            FileIOPermission permFileIO = new FileIOPermission(FileIOPermissionAccess.AllAccess, folderPath);


            try
            {
                // Demand the permission to access the C:\Temp folder.
                permFileIO.Demand();

            }
            catch (SecurityException se)
            {
                resultText.Append("The demand for permission to access the " + Servidor.STORAGE_RELATIVE_PATH + " folder failed.\nException message: ");
                resultText.Append(se.Message);
                resultText.Append("\n\n");

                objetoDesign.LastMessage = resultText.ToString();
                objetoDesign.MessageType = 3; //ERROR
            }

            try
            {

                // Delete the file if it exists.
                if (File.Exists(fileName)  )
                {
                    if (objetoDesign.IsNew)
                    {
                        objetoDesign.LastMessage = "Ya existe un diseño con el nombre " + objetoDesign.FileName;
                        objetoDesign.MessageType = 3; //ERROR
                        return;
                    }
                    else
                    {
                        File.Delete(fileName);
                    }
                }

                // Create the file.
                using (FileStream fs = File.Create(fileName))
                {
                    Byte[] info = new UTF8Encoding(true).GetBytes(objetoDesign.Data);
                    // Add some information to the file.
                    fs.Write(info, 0, info.Length);
                    fs.Close();
                }
                objetoDesign.IsNew = false;
                //objetoDesign.FileURL = Path.Combine(Servidor.STORAGE_RELATIVE_PATH , fileName);
                objetoDesign.TimeStamp = DateTime.Now.ToString("dd/MM/yyyy hh:mm");
            }

            catch (Exception Ex)
            {
                objetoDesign.LastMessage = "Ocurrió un error en el servidor: " + Ex.Message;
                objetoDesign.MessageType = 3; //ERROR
            }
        }


        //[QueryInterceptorAttribute("Design")]
        //public Expression<Func<Design, bool>> FilterDesigns() 
        //{
        //    return o => o.Customer.Name == /* Current principal name. */;
        //} 


        #endregion

        protected override DSPMetadata CreateDSPMetadata()
        {
            DSPMetadata metadata = new DSPMetadata("PFCService", "PFCarrera.services");

            // Rename the type to "Product"
            ResourceType fileDescriptorType = metadata.AddEntityType(typeof(FileDescriptor), "LearningClass");
            metadata.AddKeyProperty(fileDescriptorType, "FileName");
            metadata.AddPrimitiveProperty(fileDescriptorType, "FileURL");
            metadata.AddPrimitiveProperty(fileDescriptorType, "Description");


            metadata.AddResourceSet("LearningClass", fileDescriptorType);


            ResourceType DesignType = metadata.AddEntityType(typeof(Design), "Design");
            metadata.AddKeyProperty(DesignType, "FileName");
            //metadata.AddPrimitiveProperty(DesignType, "FileURL");
            //metadata.AddPrimitiveProperty(DesignType, "Description");
            metadata.AddPrimitiveProperty(DesignType, "Data");
            metadata.AddPrimitiveProperty(DesignType, "IsNew");
            metadata.AddPrimitiveProperty(DesignType, "LastMessage");
            metadata.AddPrimitiveProperty(DesignType, "MessageType");
            metadata.AddPrimitiveProperty(DesignType, "TimeStamp");

          

            metadata.AddResourceSet("Design", DesignType);

            return metadata;
        }

        public static void InitializeService(DataServiceConfiguration config)
        {
            config.SetEntitySetAccessRule("LearningClass", EntitySetRights.AllRead);
            config.SetEntitySetAccessRule("Design", EntitySetRights.All);
            config.DataServiceBehavior.MaxProtocolVersion = DataServiceProtocolVersion.V2;
            config.DataServiceBehavior.AcceptProjectionRequests = true;
        }
    }
}
