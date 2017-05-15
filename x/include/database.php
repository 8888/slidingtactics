<?php
if (IS_PRODUCTION) {
    abstract class DatabaseNames {
        const Tactic = "2080823_tactic";
    }
}/* elseif (IS_TEST) {
    abstract class DatabaseNames {
        const Tactic = "2080823_devtactic";
    }
} else {
    abstract class DatabaseNames {
        const Tactic = ""
    }
}*/
?>