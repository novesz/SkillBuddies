using System;
using System.IO;

namespace adminPanel.Helpers
{
    public static class PathHelper
    {
        public static string GetSolutionRoot()
        {
            var exePath = AppDomain.CurrentDomain.BaseDirectory;

            // bin\Debug\  -> adminPanel\adminPanel\
            return Directory.GetParent(exePath)
                            .Parent.Parent
                            .FullName;
        }

        public static string GetAvatarsFolder()
        {
            return Path.Combine(GetSolutionRoot(),
                                "frontend",
                                "public",
                                "avatars");
        }

        public static string GetAvatarFullPath(string fileName)
        {
            var exePath = AppDomain.CurrentDomain.BaseDirectory;

            // Go up to SkillBuddies root
            var skillBuddiesRoot = Directory.GetParent(exePath)   // Debug
                                             .Parent               // bin
                                             .Parent               // adminPanel
                                             .Parent               // adminPanel
                                             .Parent               // SkillBuddies
                                             .Parent              
                                             .FullName;

            return Path.Combine(skillBuddiesRoot,
                                "frontend",
                                "public",
                                "avatars",
                                fileName);
        }
    }
}