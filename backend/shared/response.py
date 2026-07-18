from flask import jsonify


class ApiResponse:

    @staticmethod
    def success(message="Success", data=None, status=200):

        return jsonify({
            "success": True,
            "message": message,
            "data": data
        }), status

    @staticmethod
    def error(message="Error", status=400):

        return jsonify({
            "success": False,
            "message": message
        }), status