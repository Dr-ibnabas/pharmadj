import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import {
  loginSchema,
  refreshTokenSchema,
  changerMotDePasseSchema,
} from '@pharma/shared';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data.email, data.motDePasse, req.ip);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await AuthService.refresh(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    await AuthService.logout(refreshToken);
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (err) {
    next(err);
  }
});

router.post('/changer-mot-de-passe', authenticate, async (req, res, next) => {
  try {
    const data = changerMotDePasseSchema.parse(req.body);
    await AuthService.changerMotDePasse(
      req.user!.userId,
      data.ancienMotDePasse,
      data.nouveauMotDePasse
    );
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
