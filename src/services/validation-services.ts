class ValidationServices {
    email = (email: string): boolean =>
        /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            email
        );

    isUrl = (text: string): boolean => {
        const regexp = new RegExp(/([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/);
        return regexp.test(text);
    };

    password = (password: string): boolean => password.length >= 8;

}

export default new ValidationServices();
