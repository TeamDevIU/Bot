#/bin/bash
# запускать из TgBot

echo $1
rm -rf html
sphinx-apidoc -F -o docs .
cd docs/
echo "import sys" >> new_conf.py
echo "sys.path.insert(0, '../')" >> new_conf.py
cat conf.py >> new_conf.py
mv new_conf.py conf.py
make singlehtml
cp -r _build/html/* $1/
cd ..
rm -rf docs

