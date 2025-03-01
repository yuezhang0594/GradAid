import { BrowserRouter, Routes, Route } from 'react-router-dom'

export function RouterTest() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/test" element={<div>Test page</div>} />
      </Routes>
    </BrowserRouter>
  )
}
