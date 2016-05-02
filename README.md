# ACMV
Advanced Champion Mastery Viewer - A LoL-themed website showing masteries of summoners  

Here is the [live web page](http://brallos.tk/lol/acmv/) (remember this still is work in progress)  

I'm making use of [Rome](https://github.com/bevacqua/rome).  

ACMV isn't endorsed by Riot Games and doesn't reflect the views or opinions of
Riot Games or anyone officially involved in producing or managing League of
Legends. League of Legends and Riot Games are trademarks or registered trademarks
of Riot Games, Inc. League of Legends © Riot Games, Inc.

## How to setup
### Modify files
You need an API key provided by Riot Games and an access to a database.  
Use these to complete the base.php file in the include directory.  
You need to replace `ABSOLUTE path to ACMV root folder here` in `cleancache.php` and `updatestaticdata.php` by the **absolute** path
leading to the folder where ACMV files are. You need to because otherwise php executed from CRON wouldn't be in the right working directory.  
**Note that the absolute path you put *must* end with a file separator, or it won't work.**

### Forbid access to include directory
The include directory should not be accessible by a visitor. Depending on the web server you may use a .htaccess or something else.  
I use Apache2 and I put in the virtual host file this (replace "/path to acmv root" with the right path of course):  
```
<Directory /path to acmv root/include/>
    Order deny,allow
    deny from all
</Directory>
```

### Database setup
I mentioned the use of a database. This database should contain a table like this one, named `lolmasteries`:

|Column   |Type        |Null|Default|Comment                            |
|---------|------------|----|-------|-----------------------------------|
|id       |int(11)     |No  |None   |Primary key, index, auto increment |
|name     |varchar(100)|No  |None   |Collate: utf8_bin                  |
|region   |varchar(10) |No  |None   |Collate: utf8_bin                  |
|masteries|text        |No  |None   |Collate: utf8_bin                  |
|time     |int(11)     |No  |None   |                                   |

**It is highly recommended to create a unique constraint for the couple (`name`, `region`):**  
`ALTER TABLE lolmasteries ADD UNIQUE (name,region)`  
The `id` column is not needed for the whole thing to work but is definitely recommended for speed purposes.

### CRON setup
To remove all masteries cached that didn't get updated since at least half a hour, every hour:  
```0 * * * * php -f /var/www/brallos.tk/lol/acmv/include/cleancache.php > /dev/null```  
To update champions data for each region, every 4 hours (includes names, free rotation...):  
```0 */4 * * * php -f /var/www/brallos.tk/lol/acmv/include/updatestaticdata.php > /dev/null```