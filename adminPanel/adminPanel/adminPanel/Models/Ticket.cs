using System;

namespace adminPanel.Models
{
    public class Ticket
    {
        public int TicketID { get; set; }
        public string Email { get; set; }
        public string Text { get; set; }
        public bool IsResolved { get; set; }
        public DateTime SentAt { get; set; }
    }
}
