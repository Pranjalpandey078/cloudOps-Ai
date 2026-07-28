from flask_socketio import SocketIO


socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="threading"
)


def safe_emit(event, data):

    try:

        if socketio.server:

            socketio.emit(
                event,
                data
            )

        else:

            print(
                f"Socket.IO not initialized. Skipped event: {event}"
            )

    except Exception as error:

        print(
            f"Socket emit failed: {error}"
        )



def emit_metric(metric):

    return safe_emit(
        "metric_update",
        metric
    )



def emit_incident(incident):

    return safe_emit(
        "incident_created",
        incident
    )



# Deployment Events

def emit_deployment_created(deployment):

    return safe_emit(
        "deployment_created",
        deployment
    )



def emit_deployment_progress(deployment):

    return safe_emit(
        "deployment_progress",
        deployment
    )



def emit_deployment_completed(deployment):

    return safe_emit(
        "deployment_completed",
        deployment
    )



def emit_deployment_failed(deployment):

    return safe_emit(
        "deployment_failed",
        deployment
    )



def emit_deployment_rollback(deployment):

    return safe_emit(
        "deployment_rollback",
        deployment
    )
