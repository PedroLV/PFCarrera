using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Web;

namespace PFCarrera.services
{
    public class FileDescriptor
    {
        public String FileURL { get; set; }
        public String FileName { get; set; }
        public String Description { get; set; }
    }

    /// <summary>
    /// Clase que modela un diseño.
    /// </summary>
    public class Design
    {
        /// <summary>
        /// La URL completa del fichero, para que el cliente sepa que cargar. Sólo es necesario informar esta propiedad cuando los datos van desde el servidor al cliente.
        /// </summary>
        //public String FileURL { get; set; }

        /// <summary>
        /// Nombre del Fichero.
        /// </summary>
        public String FileName { get; set; }
        //public String Description { get; set; }

        private string _data = null;

        /// <summary>
        /// Datos en formato BASE 64
        /// </summary>
        public String Data {
            get
            {
                if (_data == null)
                {
                    try
                    {
                        // Create an instance of StreamReader to read from a file.
                        // The using statement also closes the StreamReader.
                        using (StreamReader sr = new StreamReader(Path.Combine(HttpContext.Current.Server.MapPath(Servidor.STORAGE_RELATIVE_PATH), this.FileName.EndsWith(".design") ? this.FileName : this.FileName + ".design")))
                        {
                            _data = sr.ReadToEnd();
                            sr.Close();
                        }
                    }
                    catch (Exception e)
                    {
                        // Let the user know what went wrong.
                        Console.WriteLine("The file could not be read:");
                        Console.WriteLine(e.Message);
                    }
                }
                return _data;
            }
            set
            {
                _data = value;
            }
        }
        /// <summary>
        /// Devuevle true o false, si el diseño es nuevo o no
        /// </summary>
        public Boolean IsNew { get; set; }

        /// <summary>
        /// mensaje con información para el cliente. Puede contener un error.
        /// </summary>
        public String LastMessage { get; set; }

        /// <summary>
        /// Devuelve un valor con la semantica sigiente 1-- Info, 2 Warning, 3 Error, 4 Pregunta al usuario.
        /// </summary>
        public Int32 MessageType { get; set; }

        /// <summary>
        /// Devuelve la fecha hora de creación modificación del fichero.
        /// </summary>
        public String TimeStamp { get; set; }
    }
}
