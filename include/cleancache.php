<?php
$rootDir = '/var/www/brallos.tk/lol/acmv/';
require($rootDir . 'include/base.php');
$db = getDatabase();
// remove cached masteries when older than half a hour
$db->query('DELETE FROM lolmasteries WHERE time < ' . (time() - 1800));
?>