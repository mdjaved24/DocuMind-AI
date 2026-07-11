from modules.documents.models.document import (
    DocumentActivity,
    ActivityAction
)


class ActivityService:

    @staticmethod
    def create_activity(
        db,
        user_id,
        document_id,
        action: ActivityAction,
        metadata=None,
    ):

        activity = DocumentActivity(

            user_id=user_id,

            document_id=document_id,

            action=action,

            activity_metadata=metadata or {}
        )

        db.add(activity)

        return activity