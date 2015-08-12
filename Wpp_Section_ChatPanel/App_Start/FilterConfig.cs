using System.Web;
using System.Web.Mvc;

namespace Wpp_Section_ChatPanel
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}