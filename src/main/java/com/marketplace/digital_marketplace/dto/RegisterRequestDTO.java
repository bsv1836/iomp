package com.marketplace.digital_marketplace.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    private String name;
    private String email;
    private String password;
    private String mobile;
}