"use client"

import React from "react"
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
  InputBase,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { FaSearch, FaHome, FaInfoCircle, FaPhone, FaQuestionCircle } from "react-icons/fa"

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = React.useState("")

  // This function correctly handles closing the sidebar
  const handleClose = () => {
    setIsSidebarOpen(false)
  }

  return (
    <>
      {/* Menu Button - Only show when sidebar is closed */}
      {!isSidebarOpen && (
        <IconButton onClick={() => setIsSidebarOpen(true)} sx={{ position: "fixed", top: 20, right: 230, zIndex: 1300, color: "#888" }}>
          <MenuIcon fontSize="large" />
        </IconButton>
      )}

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={isSidebarOpen} onClose={handleClose}>
        <Box
          sx={{
            width: 250,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          {/* Header with Close Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <img src="assets/img/logo/logo.svg" alt="Logo" style={{ height: 40 }} />
            <IconButton onClick={handleClose} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Search Box */}
          <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
            <FaSearch style={{ marginRight: 10, color: "#888" }} />
            <InputBase
              placeholder="Search Keywords"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          <Divider />

          {/* Navigation Menu */}
          <List>
            {[
              { text: "Home", icon: <FaHome />, href: "/" },
              { text: "About", icon: <FaInfoCircle />, href: "#about" },
              { text: "Contact", icon: <FaPhone />, href: "#contact" },
              { text: "FAQ", icon: <FaQuestionCircle />, href: "#faq" },
            ].map(({ text, icon, href }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton component="a" href={href} onClick={handleClose}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ marginTop: "auto" }} />

          {/* Footer */}
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              © {new Date().getFullYear()} Meta Frost
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default SideBar

