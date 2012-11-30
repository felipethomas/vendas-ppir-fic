using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace Vendas
{
    public class VendasDAO
    {
        SqlConnection conexao = null;

        public VendasDAO()
        {
            try
            {
                string strcon = ConfigurationManager.ConnectionStrings["strBDVendas"].ToString();
                conexao = new SqlConnection(strcon);
            }
            catch (Exception ex)
            {
                throw new Exception("Erro Criação Conexão: " + ex.Message);
            }

        }

        public DataTable buscarVendedoresComPedidos()
        {
            try
            {
                string consulta = "SELECT vendedor.VendorID, " +
		                "vendedor.Name, " +
		                "COUNT(vendedor.VendorID) as numeroPedidos " +
	                "FROM Purchasing.Vendor as vendedor, " +
			            "Purchasing.PurchaseOrderHeader as pedido " +
		            "WHERE " +
			            "vendedor.VendorID = pedido.VendorID " +		
		            "GROUP BY " +
			            "vendedor.VendorID, vendedor.Name";

                SqlCommand cmd = new SqlCommand(consulta, conexao);
                conexao.Open();

                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd);
                DataTable dataTable = new DataTable();
                dataAdapter.Fill(dataTable);

                return dataTable;
            }
            catch (Exception e)
            {
                throw new Exception("Erro buscar vendedores: " + e.Message);
            }
        }

        public String buscarDadosPedido(int id)
        {
            try
            {
                string consulta = "SELECT PurchaseOrderID, OrderDate " +
                        "FROM Purchasing.PurchaseOrderHeader " +
                        "WHERE VendorID = @id";

                SqlCommand cmd = new SqlCommand(consulta, conexao);
                cmd.Parameters.AddWithValue("@id", id);
                conexao.Open();

                SqlDataReader dr = cmd.ExecuteReader();
                String json = "";

                while(dr.Read())
                {
                    json += "{";
  
                    for (int campo = 0; campo < dr.FieldCount; campo++)
                    {
                        string strCampo = string.Format("\"{0}\":\"{1}\"", dr.GetName(campo), dr[campo]);
                        
                        if (campo == 0)
                            json += strCampo;
                        else
                            json += ", " + strCampo;                        
                    }

                    json += "};";
                }

                return json;
            }
            catch (Exception e)
            {
                throw new Exception("Erro buscar pedidos: " + e.Message);
            }
        }

        public DataTable buscarPedido(int id)
        {
            try
            {
                string consulta = "SELECT Production.Product.Name, UnitPrice, OrderQty, UnitPrice*OrderQty as totalproduto " +
                        "FROM Purchasing.PurchaseOrderDetail,Production.Product " +
                        "WHERE Purchasing.PurchaseOrderDetail.ProductID = Production.Product.ProductID " +
                        "AND PurchaseOrderID = @id";

                SqlCommand cmd = new SqlCommand(consulta, conexao);
                cmd.Parameters.AddWithValue("@id", id);
                conexao.Open();

                SqlDataAdapter dataAdapter = new SqlDataAdapter(cmd);
                DataTable dataTable = new DataTable();
                dataAdapter.Fill(dataTable);

                return dataTable;
            }
            catch (Exception e)
            {
                throw new Exception("Erro buscar detalhes do pedido: " + e.Message);
            }
        }
    }
}