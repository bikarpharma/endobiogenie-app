-- Mettre à jour TOUS les utilisateurs pour qu'ils deviennent ADMIN
UPDATE "User" SET role = 'ADMIN';

-- Si vous voulez mettre à jour UN utilisateur spécifique par email, utilisez plutôt :
-- UPDATE "User" SET role = 'ADMIN' WHERE email = 'votre-email@exemple.com';
