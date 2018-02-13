## create the .conf file and place it into the directory apache will search for
sudo ln -s /var/www/git/More/clientside-request/test/env/_dev/server/apache.conf /etc/apache2/sites-available/clientside-request.conf &&
sudo ln -s /etc/apache2/sites-available/clientside-request.conf /etc/apache2/sites-enabled/clientside-request.conf
sudo service apache2 restart
