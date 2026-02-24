using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdminPanel.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public int RankID { get; set; }  
        public int Tokens { get; set; }
        public string AvatarUrl { get; set; }

        public string RankName => RankID == 1 ? "Admin" : "User";  
    }
}