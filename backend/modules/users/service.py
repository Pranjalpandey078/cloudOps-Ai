from modules.users.repository import UserRepository

class UserService:

    repository = UserRepository()

    def profile(self,user_id):

        user = self.repository.get_profile(user_id)

        if not user:

            return {
                "message":"User not found"
            },404

        return user