package com.marketplace.digital_marketplace.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    private String email;
    private String password;
}