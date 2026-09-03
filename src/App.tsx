import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Research from './pages/Research'
import Publications from './pages/Publications'
import Media from './pages/Media'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import People from './pages/People'
import MemberProfile from './pages/MemberProfile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/people" element={<People />} />
      <Route path="/research" element={<Research />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/media" element={<Media />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/people/:id" element={<MemberProfile />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
