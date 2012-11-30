using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Xml;
using System.Text;
using System.IO;

namespace Vendas
{
    public partial class RetornaDadosVendedores : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                retornaDadosVendedores();
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.Write(string.Format("{{\"erro\":\"{0}\"}}", ex.Message));
            }
        }

        private void retornaDadosVendedores()
        {
            try
            {
                VendasDAO dao = new VendasDAO();
                DataTable dt = dao.buscarVendedoresComPedidos();
                DataTableReader dtr = dt.CreateDataReader();

                Response.ContentType = "text/xml";
                XmlWriter xVendedores = new XmlTextWriter(Response.OutputStream, Encoding.GetEncoding("ISO-8859-1"));

                xVendedores.WriteStartDocument();
                xVendedores.WriteStartElement("VENDEDORES");

                while (dtr.Read())
                {
                    xVendedores.WriteStartElement("VENDEDOR");
                    for (int campo = 0; campo < dtr.FieldCount; campo++)
                    {
                        xVendedores.WriteElementString(
                            dtr.GetName(campo),
                            dtr[campo].ToString());
                    }
                    xVendedores.WriteEndElement();
                }

                xVendedores.WriteEndElement();
                xVendedores.Close();
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.Write(string.Format("{{\"erro\":\"{0}\"}}", ex.Message));
            }
        }
    }
}