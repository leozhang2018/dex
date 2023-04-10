const hostname = window.location.hostname;
const protocol = window.location.protocol;
const port = window.location.port;

// login();
var dex = new Vue({
    el: "#dex-login",
    delimiters: ["<<<", ">>>"],
    data: {
        loading: false,
        loginForm: {
            account: "",
            password: "",
        },
        otherLogin:{
            login:'',
            password:''
        },
        showRegistration: false,
        showLoginError: false,
        showPassword: false,
        rules: {
            account: [
                { required: true, message: '请输入用户名', trigger: 'change' }
            ],
            password: [{ required: true, message: '请输入密码', trigger: 'change' }]
        }
    },
    computed: {
        year() {
            return new Date().getFullYear()
        }
    },
    methods: {
        async login() {
            this.$refs.loginForm.validate(async valid => {
                if (valid) {
                    const payload = this.loginForm;
                    this.loading = true
                    try {
                        const userInfoRes = await axios.post("/api/v1/login", payload);
                        const userInfo = userInfoRes.data;
                        if (userInfo) {
                            store.set("userInfo", userInfo);
                            const roleBindingRes = await axios.get(
                                `/api/v1/userbindings?uid=${userInfo.uid}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${userInfo.token}`,
                                    },
                                }
                            );
                            const roleBinding = roleBindingRes.data;
                            if (roleBinding) {
                                const role = roleBinding.map((item) => item.role);
                                store.set("role", role);
                                if (port) {
                                    window.location.href = `${protocol}//${hostname}:${port}/v1/projects`;
                                }
                                else {
                                    window.location.href = `${protocol}//${hostname}/v1/projects`;
                                }
                            }
                        }
                    }
                    catch (error) {
                        this.loading = false
                        this.showLoginError = true;
                    }
                }
            })

        },
        async registrationCheck() {
            const registrationRes = await axios.get(`/api/v1/features/RegisterTrigger`);
            if (registrationRes.data && registrationRes.data.enabled) {
                this.showRegistration = true
            } else {
                this.showRegistration = false
            }
        }
    },
    mounted() {
        this.registrationCheck();
    },
});
