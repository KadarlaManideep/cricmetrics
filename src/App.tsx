import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Batting from './pages/Batting'
import Bowling from './pages/Bowling'
import PlayerProfile from './pages/PlayerProfile'
import PointsTable from './pages/PointsTable'
import TeamStats from './pages/TeamStats'
import Matches from './pages/Matches'
import HeadToHead from './pages/HeadToHead'
import Records from './pages/Records'
import Analytics from './pages/Analytics'

const App: React.FC = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/batting" element={<Batting />} />
        <Route path="/bowling" element={<Bowling />} />
        <Route path="/player/:name" element={<PlayerProfile />} />
        <Route path="/points" element={<PointsTable />} />
        <Route path="/teams" element={<TeamStats />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/h2h" element={<HeadToHead />} />
        <Route path="/records" element={<Records />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)

export default App
