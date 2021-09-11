#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django import forms

search_frequency_choices = (
    ('', u''),
    ('frequently', u'Several times a day'),
    ('usually', u'Once per day'),
    ('sometimes', u'Several times a week'),
    ('rarely', u'Less than once a week'),
)
search_history_choices = (
    ('', u''),
    ('very long', u'five years or longer'),
    ('long', u'three to five years'),
    ('short', u'one to three years'),
    ('very short', u'less than one year'),
)


class LoginForm(forms.Form):
    username = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Please input the username',
            }
        )
    )
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Password',
            }
        )
    )


class SignupForm(forms.Form):
    username = forms.CharField(
        required=True,
        min_length=6,
        label=u'Username',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Please input the username',
            }
        )
    )
    password = forms.CharField(
        required=True,
        min_length=6,
        label=u'Password',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Password',
            }
        )
    )
    password_retype = forms.CharField(
        required=True,
        min_length=6,
        label=u'Please input the password again',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Please input the password again',
            }
        )
    )
    name = forms.CharField(
        required=True,
        label=u'Name',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Name',
            }
        )
    )
    sex = forms.CharField(
        required=True,
        label=u'Gender',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'gender',
            }
        )
    )
    age = forms.IntegerField(
        required=True,
        label=u'Age',
        widget=forms.NumberInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Age',
            }
        )
    )
    phone = forms.CharField(
        required=True,
        label=u'Phone Number',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Phone Number',
            }
        )
    )
    email = forms.EmailField(
        required=True,
        label=u'E-mail Address',
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'E-mail Address',
            }
        )
    )
    field = forms.CharField(
        required=True,
        label=u'Occupation',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Occupation',
            }
        )
    )
    search_frequency = forms.ChoiceField(
        required=True,
        choices=search_frequency_choices,
        label=u'How often fo you use search engines?',
        widget=forms.Select(
            attrs={
                'class': 'select2-container form-control select select-primary',
            }
        )
    )
    search_history = forms.ChoiceField(
        required=True,
        choices=search_history_choices,
        label=u'How long have you been using search engines?',
        widget=forms.Select(
            attrs={
                'class': 'select2-container form-control select select-primary',
            }
        )
    )

    def clean(self):
        cleaned_data = super(SignupForm, self).clean()
        password = cleaned_data.get('password')
        password_retype = cleaned_data.get('password_retype')

        if password != password_retype:
            raise forms.ValidationError(
                u'The two passwords are inconsistent!'
            )

        return cleaned_data


class EditInfoForm(forms.Form):
    name = forms.CharField(
        required=True,
        label=u'Name',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Name',
            }
        )
    )
    sex = forms.CharField(
        required=True,
        label=u'Gender',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Gender',
            }
        )
    )
    age = forms.IntegerField(
        required=True,
        label=u'Age',
        widget=forms.NumberInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Age',
            }
        )
    )
    phone = forms.CharField(
        required=True,
        label=u'Phone Number',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Phone Number',
            }
        )
    )
    email = forms.EmailField(
        required=True,
        label=u'E-mail Address',
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'E-mail Address',
            }
        )
    )
    field = forms.CharField(
        required=True,
        label=u'Occupation',
        widget=forms.TextInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Occupation',
            }
        )
    )
    search_frequency = forms.ChoiceField(
        required=True,
        choices=search_frequency_choices,
        label=u'How often fo you use search engines?',
        widget=forms.Select(
            attrs={
                'class': 'select2-container form-control select select-primary',
            }
        )
    )
    search_history = forms.ChoiceField(
        required=True,
        choices=search_history_choices,
        label=u'How long have you been using search engines?',
        widget=forms.Select(
            attrs={
                'class': 'select2-container form-control select select-primary',
            }
        )
    )


class EditPasswordForm(forms.Form):

    cur_password = forms.CharField(
        required=True,
        min_length=6,
        label=u'Current password',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'password',
            }
        )
    )
    new_password = forms.CharField(
        required=True,
        min_length=6,
        label=u'New password',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'password',
            }
        )
    )
    new_password_retype = forms.CharField(
        required=True,
        min_length=6,
        label=u'Please input the new password again',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Please input the new password again',
            }
        )
    )

    def clean(self):
        cleaned_data = super(EditPasswordForm, self).clean()
        password = cleaned_data.get('new_password')
        password_retype = cleaned_data.get('new_password_retype')

        if password != password_retype:
            raise forms.ValidationError(
                u'The two passwords are inconsistent!'
            )

        return cleaned_data


class ForgetPasswordForm(forms.Form):
    email = forms.EmailField(
        required=True,
        label=u'E-mail Address',
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Input E-mail address',
            }
        )
    )


class ResetPasswordForm(forms.Form):

    new_password = forms.CharField(
        required=True,
        min_length=6,
        label=u'New password',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'password',
            }
        )
    )
    new_password_retype = forms.CharField(
        required=True,
        min_length=6,
        label=u'Please input the new password again',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control login-field',
                'placeholder': u'Please input the new password again',
            }
        )
    )

    def clean(self):
        cleaned_data = super(ResetPasswordForm, self).clean()
        password = cleaned_data.get('new_password')
        password_retype = cleaned_data.get('new_password_retype')

        if password != password_retype:
            raise forms.ValidationError(
                u'The two passwords are inconsistent!'
            )

        return cleaned_data