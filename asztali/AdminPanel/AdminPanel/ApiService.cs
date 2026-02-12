using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using AdminPanel.Models;

namespace AdminPanel
{
    public class ApiService
    {
        private readonly HttpClient _client;

        public ApiService()
        {
            _client = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:3001/") // A backend címe
            };
        }

        // Bejelentkezés ellenőrzése
        public async Task<User?> LoginAsync(string username, string password)
        {
            var response = await _client.GetAsync($"users/login?username={username}&password={password}");
            if (!response.IsSuccessStatusCode) return null;

            return await response.Content.ReadFromJsonAsync<User>();
        }

        // Felhasználók lekérése
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _client.GetFromJsonAsync<List<User>>("users/all");
        }

        // Chatek lekérése
        public async Task<List<Chat>> GetAllChatsAsync()
        {
            return await _client.GetFromJsonAsync<List<Chat>>("chats/all");
        }

        // Chat tagok lekérése
        public async Task<List<User>> GetUsersInChatAsync(int chatId)
        {
            return await _client.GetFromJsonAsync<List<User>>($"chats/chatUsers/{chatId}");
        }
        public async Task<List<Message>> GetMessagesInChatAsync(int chatId)
        {
            return await _client.GetFromJsonAsync<List<Message>>($"messages/{chatId}");
        }
    }
}
