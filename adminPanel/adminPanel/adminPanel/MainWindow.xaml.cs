using adminPanel.Data;
using adminPanel.Models;
using Google.Protobuf.WellKnownTypes;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Media;

namespace adminPanel
{
    /// <summary>
    /// Csak design – mint adatok, nincs adatbázis/bejelentkezés.
    /// </summary>
    public partial class MainWindow : Window
    {
        public static bool isLoggedIn { get; set; }
        public static int loginRank { get; set; }
        public static Action lastClicked { get; set; }
        public static List<int> changedIndexes = new List<int>();
        public static int selectedUserIndex { get; set; }
        public static DataTable dataGridData { get; set; }
        private void searchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            DataTable dt = dataGridData;
            if (dt == null) return;
            else
            {
                string filter = searchBox.Text.Trim().Replace("'", "''");
                if (string.IsNullOrEmpty(filter))
                {
                    dataGrid.ItemsSource = dt.DefaultView;
                }
                else
                {
                    try
                    {
                        try
                        {
                            dt.DefaultView.RowFilter = $"Username LIKE '%{filter}%' OR Email LIKE '%{filter}%'";
                        }
                        catch
                        {
                            dt.DefaultView.RowFilter = $"Email LIKE '%{filter}%' OR Email LIKE '%{filter}%'";
                        }
                        dataGrid.ItemsSource = dt.DefaultView;
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("Error applying filter: " + ex.Message);
                    }
                }
            }
        }

        private void Login_Click(object sender, RoutedEventArgs e)
        {
            if (!isLoggedIn)
            {
                Login loginWindow = new Login();
                loginWindow.ShowDialog();
                if (isLoggedIn)
                {
                    LoginOut.Content = "Logged In";
                }
            }
            else
            {
                MessageBox.Show("Already logged in.");
            }
        }

        private void usersButton_Click(object sender, RoutedEventArgs e)
        {
            isLoggedIn = true;
            usersButton.Background = (SolidColorBrush)(new BrushConverter().ConvertFrom("#22FFFFFF"));
            ticketsButton.Background = default;
            dashBoardButton.Background = default;
            replyButton.IsEnabled = false;
            banButton.IsEnabled = true;
            unbanButton.IsEnabled = true;
            saveChanges.IsEnabled = true;

            lastClicked = LoadUsers; // store the method

            if (isLoggedIn)
            {
                LoadUsers();
            }
        }

        private void ticketsButton_Click(object sender, RoutedEventArgs e)
        {
            isLoggedIn = true;
            usersButton.Background = default;
            dashBoardButton.Background = default;
            ticketsButton.Background = (SolidColorBrush)(new BrushConverter().ConvertFrom("#22FFFFFF"));
            replyButton.IsEnabled = true;
            banButton.IsEnabled = false;
            unbanButton.IsEnabled = false;
            saveChanges.IsEnabled = true;
            lastClicked = LoadTickets; // store the method

            if (isLoggedIn)
            {
                LoadTickets();
            }
        }
        private void LoadUsers()
        {
            changedIndexes.Clear();
            try
            {
                using (var conn = Database.GetConnection())
                {
                    conn.Open();
                    const string sql = "SELECT UserID, Username, Email, Tokens, RankID FROM users;";

                    using (var cmd = new MySqlCommand(sql, conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        var dt = new DataTable();
                        dt.Load(reader);
                        dataGrid.AutoGenerateColumns = true;
                        dataGridData = dt;
                        dataGrid.ItemsSource = dataGridData.DefaultView;
                        
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading users: " + ex.Message);
            }
        }

        private void LoadTickets()
        {
            changedIndexes.Clear();
            try
            {
                using (var conn = Database.GetConnection())
                {
                    conn.Open();
                    const string sql = "SELECT * FROM tickets;";

                    using (var cmd = new MySqlCommand(sql, conn))
                    using (var reader = cmd.ExecuteReader())
                    {
                        var dt = new DataTable();
                        dt.Load(reader);
                        dataGrid.AutoGenerateColumns = true;
                        dataGridData = dt;
                        dataGrid.ItemsSource = dataGridData.DefaultView;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error loading tickets: " + ex.Message);
            }
        }
        private void refreshButton_Click(object sender, RoutedEventArgs e)
        {
            if (lastClicked != null)
            {
                lastClicked.Invoke(); // rerun the last query
            }
            else
            {
                MessageBox.Show("No previous action to refresh.");
            }
        }

        private void dataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Ensure a row is selected
            if (dataGrid.SelectedItem == null) return;

            // Get the selected row (your bound data object)
            var selectedRow = dataGrid.SelectedItem;
            selectedUserIndex = dataGrid.Items.IndexOf(selectedRow);
            replyBox.Text = ""; // Clear the reply box when a new user is selected
            int columnIndex = 1; // e.g., second column
            var cellValue = dataGrid.Columns[columnIndex].GetCellContent(selectedRow) as TextBlock;
            if (cellValue != null)
            {
                selectedUser.Text = cellValue.Text;
            }
        }

        private void dataGrid_RowEditEnding(object sender, DataGridRowEditEndingEventArgs e)
        {
            // Only handle the commit action
            if (e.EditAction != DataGridEditAction.Commit)
                return;

            int rowIndex = dataGrid.Items.IndexOf(e.Row.Item);

            if (!changedIndexes.Contains(rowIndex))
                changedIndexes.Add(rowIndex);

            
        }
    }
}
