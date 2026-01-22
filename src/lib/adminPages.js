import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pageDir = (name) => path.join(__dirname, '..', '..', 'Admin', 'html', `${name}.html`);

function adminPages(app) {
  app.use(express.static(path.join(__dirname, '..', '..', 'Admin')));

app.use('/assets', express.static(path.join(__dirname, '..', '..', 'assets')));

app.get('/admin', (req, res) => res.
 sendFile(pageDir('login')));
app.get('/admin/panel', (req, res) => res.sendFile(pageDir('panel')));
app.get('/admin/manager', (req, res) => res.sendFile(pageDir('Manager')));
app.get('/admin/users', (req, res) => res.sendFile(pageDir('users')));
  
}

export default adminPages;
