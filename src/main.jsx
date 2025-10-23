import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter } from 'react-router-dom';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';

if(process.env.NODE_ENV === 'production') disableReactDevTools(); 

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
  </StrictMode>,
)
