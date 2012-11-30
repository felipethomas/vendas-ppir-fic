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
    public partial class RetornaDetalhesPedido : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                String param = Request.Form["id"];
                int id = int.Parse(param);

                retornaDetalhesPedidoXML(id);
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.Write(string.Format("{{\"erro\":\"{0}\"}}", ex.Message));
            }
        }

        private void retornaDetalhesPedidoXML(int id)
        {
            try
            {
                VendasDAO dao = new VendasDAO();
                DataTable dt = dao.buscarPedido(id);
                DataTableReader dtr = dt.CreateDataReader();

                Response.ContentType = "text/xml";
                XmlWriter xPedido = new XmlTextWriter(Response.OutputStream, Encoding.GetEncoding("ISO-8859-1"));

                xPedido.WriteStartDocument();
                xPedido.WriteStartElement("DETALHES");

                while(dtr.Read())
                {
                    xPedido.WriteStartElement("DETALHE");
                    for (int campo = 0; campo < dtr.FieldCount; campo++)
                    {
                        xPedido.WriteElementString(
                            dtr.GetName(campo),
                            dtr[campo].ToString());
                    }
                    xPedido.WriteEndElement();
                }

                xPedido.WriteEndElement();
                xPedido.Close();
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.Write(string.Format("{{\"erro\":\"{0}\"}}", ex.Message));
            }
        }
    }
}