import bcrypt


class PasswordSecurity:

    @staticmethod
    def hash_password(password):

        return bcrypt.hashpw(

            password.encode(),

            bcrypt.gensalt()

        ).decode()

    @staticmethod
    def verify(password, hashed):

        return bcrypt.checkpw(

            password.encode(),

            hashed.encode()

        )