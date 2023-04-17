import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';

import Buy from "../views/Buy"
import User from "../views/User"

export default function RouterView() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<User></User>}></Route>
                <Route path="/buy" element={<Buy></Buy>}></Route>
                <Route path="/user" element={<User></User>}></Route>
            </Routes>
        </Router>
    )

}