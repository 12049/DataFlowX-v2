import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pageDir = (name) => path.join(__dirname, '..', '..', 'public', 'html', `${name}.html`);

function setupPages(app) {
  app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.use('/assets', express.static(path.join(__dirname, '..', '..', 'assets')));

app.get('/', (req, res) => res.
 sendFile(pageDir('index')));
app.get('/login', (req, res) => res.sendFile(pageDir('login')));
app.get('/home', (req, res) => res.sendFile(pageDir('dashboard')));
app.get('/profile', (req, res) => res.sendFile(pageDir('profile')));
app.get('/api-list', (req, res) => res.sendFile(pageDir('APIS')));
app.get('/help', (req, res) => res.sendFile(pageDir('help')));
app.get('/contact', (req, res) => res.sendFile(pageDir('Contact')));
  
}

export default setupPages;
