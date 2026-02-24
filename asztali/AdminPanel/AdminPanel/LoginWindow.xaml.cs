using AdminPanel.Models;
using System.Windows;

namespace AdminPanel
{
    public partial class LoginWindow : Window
    {
        public LoginWindow()
        {
            InitializeComponent();
        }

        private void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            string username = UsernameBox.Text;
            string password = PasswordBox.Password;

            // IDEIGLENES ADMIN LOGIN
            if (username == "admin" && password == "1234")
            {
                User adminUser = new User
                {
                    UserID = 999,
                    Username = "Ideiglenes Admin",
                    RankID = 3 // owner
                };

                MainWindow main = new MainWindow(adminUser);
                main.Show();
                this.Close();
            }
            else
            {
                MessageBox.Show("Hibás felhasználónév vagy jelszó!");
            }
        }
    }
}
