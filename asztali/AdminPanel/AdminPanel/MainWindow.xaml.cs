using AdminPanel.Models;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace AdminPanel
{
    public partial class MainWindow : Window
    {
        private ApiService _api = new ApiService();
        private User _loggedUser;

        public MainWindow(User user)
        {
            InitializeComponent();
            _loggedUser = user;
            LoadData();
        }

        private async void LoadData()
        {
            // Felhasználók betöltése
            var users = await _api.GetAllUsersAsync();
            UsersGrid.ItemsSource = users;

            // Chatek betöltése
            var chats = await _api.GetAllChatsAsync();
            ChatsGrid.ItemsSource = chats;
        }

        // CHAT KIVÁLASZTÁS
        private async void ChatsGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ChatsGrid.SelectedItem is Chat selectedChat)
            {
                // Chat tagok betöltése
                var chatUsers = await _api.GetUsersInChatAsync(selectedChat.ChatID);
                ChatUsersGrid.ItemsSource = chatUsers;

                // Üzenetek betöltése
                var messages = await _api.GetMessagesInChatAsync(selectedChat.ChatID);
                MessagesGrid.ItemsSource = messages;
            }
        }
    }
}
