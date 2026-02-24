using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdminPanel.Models
{
    public class Message
    {
        public int MsgID { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public int UserID { get; set; }
        public string Username { get; set; }
    }
}
