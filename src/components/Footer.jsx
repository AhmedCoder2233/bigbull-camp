import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-white mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Logo and Brand */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 md:gap-4 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-r  flex items-center justify-center shadow-lg">
                <img 
  src="/logo.png" 
  alt="BigBull CAMP Logo" 
  className="w-8 h-8 md:w-12 md:h-12 object-contain"
/>
            </div>
            <div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                BIG BULL CAMP
              </div>
              <div className="text-gray-500 text-xs md:text-sm">Professional Project Management</div>
            </div>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05, color: "#dc2626" }}
              onClick={() => navigate("/workspaces")}
              className="text-gray-600 hover:text-red-600 font-medium text-sm md:text-base transition-colors"
            >
              Dashboard
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, color: "#dc2626" }}
              onClick={() => navigate("/invites")}
              className="text-gray-600 hover:text-red-600 font-medium text-sm md:text-base transition-colors"
            >
              Team Management
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, color: "#dc2626" }}
              onClick={() => navigate("/pricing")}
              className="text-gray-600 hover:text-red-600 font-medium text-sm md:text-base transition-colors"
            >
              Pricing
            </motion.button>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6 md:my-8"></div>
        
        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm md:text-base">© {new Date().getFullYear()} BigBull CAMP. All rights reserved.</p>
          <p className="mt-2 text-xs md:text-sm text-gray-400">Built with ❤️ for teams that deliver excellence</p>
        </motion.div>
      </div>
    </footer>
  );
}
