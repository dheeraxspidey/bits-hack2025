import React from 'react'
import { useState, useEffect } from 'react'
import { Box, Button, Typography, Grid, TextField } from '@mui/material'

const Integrations = () => {
  const [githubToken, setGithubToken] = useState('')
  const [leetcodeUsername, setLeetcodeUsername] = useState('')

  const handleGithubConnect = async () => {
    try {
      await api.syncGithub(githubToken)
      alert('GitHub activities synced successfully!')
    } catch (error) {
      alert('Error syncing GitHub activities')
    }
  }

  const handleLeetcodeConnect = async () => {
    try {
      await api.syncLeetcode(leetcodeUsername)
      alert('LeetCode activities synced successfully!')
    } catch (error) {
      alert('Error syncing LeetCode activities')
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Account Integrations</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box border={1} p={2} borderRadius={2}>
            <Typography variant="h6" gutterBottom>GitHub Integration</Typography>
            <TextField
              label="GitHub Access Token"
              fullWidth
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              margin="normal"
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleGithubConnect}
            >
              Sync GitHub Repositories
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box border={1} p={2} borderRadius={2}>
            <Typography variant="h6" gutterBottom>LeetCode Integration</Typography>
            <TextField
              label="LeetCode Username"
              fullWidth
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              margin="normal"
            />
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleLeetcodeConnect}
            >
              Sync LeetCode Solutions
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Integrations 