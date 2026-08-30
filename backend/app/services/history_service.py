import json
import os
from datetime import datetime
from uuid import uuid4


# =====================================
# HISTORY FILE CONFIGURATION
# =====================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

HISTORY_DIR = os.path.join(
    BASE_DIR,
    "data"
)

HISTORY_FILE = os.path.join(
    HISTORY_DIR,
    "reconciliation_history.json"
)


# =====================================
# CREATE HISTORY DIRECTORY
# =====================================

os.makedirs(
    HISTORY_DIR,
    exist_ok=True
)


# =====================================
# LOAD HISTORY
# =====================================

def load_history():

    if not os.path.exists(
        HISTORY_FILE
    ):

        return []

    try:

        with open(
            HISTORY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            history = json.load(
                file
            )

            return history

    except (
        json.JSONDecodeError,
        IOError
    ):

        return []


# =====================================
# SAVE HISTORY TO FILE
# =====================================

def save_history(
    history
):

    with open(
        HISTORY_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            history,
            file,
            indent=4,
            default=str
        )


# =====================================
# ADD RECONCILIATION RESULT
# =====================================

def add_reconciliation_history(
    reconciliation_result
):

    history = load_history()

    record = {

        "id": str(
            uuid4()
        ),

        "created_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "summary": reconciliation_result.get(
            "summary",
            {}
        ),

        "result": reconciliation_result
    }

    history.insert(
        0,
        record
    )

    save_history(
        history
    )

    return record


# =====================================
# GET ALL HISTORY
# =====================================

def get_reconciliation_history():

    return load_history()


# =====================================
# GET SINGLE HISTORY RECORD
# =====================================

def get_history_by_id(
    history_id
):

    history = load_history()

    for record in history:

        if record.get(
            "id"
        ) == history_id:

            return record

    return None


# =====================================
# DELETE HISTORY RECORD
# =====================================

def delete_history_record(
    history_id
):

    history = load_history()

    updated_history = [

        record
        for record in history
        if record.get(
            "id"
        ) != history_id
    ]

    if len(
        updated_history
    ) == len(
        history
    ):

        return False

    save_history(
        updated_history
    )

    return True


# =====================================
# CLEAR ALL HISTORY
# =====================================

def clear_reconciliation_history():

    save_history(
        []
    )

    return True