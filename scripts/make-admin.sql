-- Mettre à jour TOUS les utilisateurs pour qu'ils deviennent ADMIN
UPDATE "users" SET role = 'ADMIN';

-- Si vous voulez mettre à jour UN utilisateur spécifique par email, utilisez plutôt :
-- UPDATE "users" SET role = 'ADMIN' WHERE email = 'votre-email@exemple.com';
