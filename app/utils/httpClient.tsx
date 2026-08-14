import axios from "axios";

const HttpClient = axios.create({
    baseURL: "https://api.deezer.com",
    timeout: 60000,
    headers: {
        "Content-Type": "application/json"
    },
});

export default HttpClient;