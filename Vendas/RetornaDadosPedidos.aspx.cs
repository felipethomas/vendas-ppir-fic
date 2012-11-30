using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;
using System.IO;

namespace Vendas
{
    public partial class RetornaDadosPedidos : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                String param = Request.Form["id"];
                int id = int.Parse(param);

                retornaDadosPedidosJSON(id);
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.Write(string.Format("{{\"erro\":\"{0}\"}}", ex.Message));
            }
        }

        private void retornaDadosPedidosJSON(int id)
        {
            try
            {
                VendasDAO dao = new VendasDAO();
                String dadosPedidoJSON = dao.buscarDadosPedido(id);
                Response.ContentType = "application/json";
               
                TextWriter tw = new StreamWriter(Response.OutputStream, Encoding.GetEncoding("ISO-8859-1"));
                tw.Write(dadosPedidoJSON);
                tw.Close();
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.Write(string.Format("{{\"erro\":\"{0}\"}}", ex.Message));
            }
        }
    }
}