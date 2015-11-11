systems({

    'my-app': {
        depends: ['mysql', 'redis'],
        image: {"docker": "azukiapp/php-fpm:5.6"},
        // provision: [
        //   "composer install"
        // ],
        workdir: "/azk/#{manifest.dir}",
        shell: "/bin/bash",
        wait: 20,
        mounts: {
            '/azk/#{manifest.dir}': sync("./php")
        },
        scalable: {"default": 1},
        http: {
            domains: ["#{system.name}.#{azk.default_domain}"]
        },
        ports: {
            http: "80/tcp",
        },
        envs: {
            APP_DIR: "/azk/#{manifest.dir}",
        },
    },

    mysql: {
        image: {"docker": "azukiapp/mysql:5.7"},
        shell: "/bin/bash",
        wait: 25,
        mounts: {
            '/var/lib/mysql': persistent("#{manifest.dir}/mysql"),
        },
        ports: {
            data: "3306/tcp",
        },
        envs: {
            MYSQL_ROOT_PASSWORD: "your-root-password",
            MYSQL_USER: "your-user",
            MYSQL_PASS: "your-password",
            MYSQL_DATABASE: "#{manifest.dir}_development"
        },
        export_envs: {
            MYSQL_USER: "your-user",
            MYSQL_PASS: "your-password",
            MYSQL_DATABASE: "#{manifest.dir}_development"
        },
    },

    redis: {
        scalable: false,
        image: {docker: "library/redis"},
        mounts: {
            "/data": persistent("#{manifest.dir}/redis")
        },
        export_envs: {
            REDIS_PORT: "#{net.port[6379]}",
            REDIS_HOST: "#{net.host}",
        },
        http: {domains: ["#{manifest.dir}-#{system.name}.#{azk.default_domain}"]},
        wait: {retry: 20, timeout: 2000},
        ports: {data: "6379/tcp"}
    },

    node: {
        depends: ['redis'],
        image: {'docker': 'azukiapp/node'},
        provision: [
            'npm install',
        ],
        workdir: '/azk/#{manifest.dir}',
        shell: '/bin/bash',
        command: "pwd && ls -al && npm start",
        wait: {retry: 20, timeout: 2000},
        mounts: {
            '/azk/#{manifest.dir}': sync("."),
            '/azk/#{manifest.dir}/node_modules': persistent("./node_modules"),
        },
        scalable: {'default': 1},
        http: {
            domains: ['#{system.name}.#{azk.default_domain}']
        },
        ports: {
            http: "3000/tcp",
        },
        envs: {
            NODE_ENV: "production",
        },
    },

});