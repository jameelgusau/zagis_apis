

export const basicUserDetails = (account: any) => {
    const {
        id,
        full_name,
        phone,
        email,
        role,
        image,
        isVerified, rank_id, rank
    } = account;
    return {
        id,
        full_name,
        phone,
        email,
        image,
        role,
        isVerified,
        rank_id,
        rank_name: rank?.rank_name,
        department_name: rank?.department?.department_name,
        department_id: rank?.department_id
    };
}

export const basicSchoolDetails = (school: any) => {
    const {
        id,
        name,
        ward,
        school_code,
        street_name,
        school_community,
        email,
        phone,
        lat,
        lon,
        location,
        lga,

    } = school
    return {
        id,
        name,
        ward,
        school_code,
        street_name,
        school_community,
        email,
        phone,
        lat,
        lon,
        location,
        lga: lga?.name || '',
        lga_id: lga?.id || ''
    }
}

export const basicCaregiverDetails = (caregiver: any) => {
    const { id, name, gender, age, community, phone, relationship, qualification, employment, image, nin, bvn, account, createdAt } = caregiver

    const created_by = `${account?.first_name} ${account?.middle_name} ${account?.last_name}`
    return {
        id, name, gender, age, community, phone, relationship, qualification, image, employment, nin, bvn, created_by, created_at: createdAt
    }
}

export const basicBaneficiaryDetails = (beneficiary: any) => {
    const { id, first_name, last_name, reg_no, middle_name, gender, distance, dob, disability, has_writing_material, relationship, has_textbook, has_uniform, image, languages, has_disability, has_bag, account, lga, school, cohort, classroom, caregiver, arm } = beneficiary

    const created_by = `${account?.first_name} ${account?.middle_name} ${account?.last_name}`

    return {
        first_name,
        last_name,
        middle_name,
        arm,
        id, gender, dob, languages, has_uniform, relationship, reg_no, image, has_textbook, has_disability, disability, has_bag, has_writing_material, distance, created_by,
        lga: lga?.name || '',
        lga_id: lga?.id || '',
        school: school?.name || '',
        school_id: school?.id || '',
        cohort: cohort?.name || '',
        cohort_id: cohort?.id || '',
        classroom: classroom?.name || '',
        classroom_id: classroom?.id || '',
        caregiver: caregiver?.name || '',
        caregiver_id: caregiver?.id || '',
    }
}

export const basicTermsDetails = (term: any) => {
    const {
        id,
        name,
        session,
        start_date,
        end_date,
        is_active,
    } = term
    return {
        id,
        name,
        session,
        start_date,
        end_date,
        is_active,
    }
}
export const basicBaneficiariesDetails = (beneficiary: any) => {
    const { id, first_name, last_name, reg_no, middle_name, gender, distance, dob, disability, has_writing_material, relationship, has_textbook, has_uniform, image, languages, has_disability, has_bag, account, lga, school, cohort, classroom, caregiver, arm } = beneficiary

    const created_by = `${account?.first_name} ${account?.middle_name} ${account?.last_name}`

    return {
        first_name,
        last_name,
        middle_name,
        arm,
        id, gender, dob, languages, has_uniform, relationship, reg_no, image, has_textbook, has_disability, disability, has_bag, has_writing_material, distance, created_by,
        lga: lga?.name || '',
        lga_id: lga?.id || '',
        school: school?.name || '',
        school_id: school?.id || '',
        cohort: cohort?.name || '',
        cohort_id: cohort?.id || '',
        classroom: classroom?.name || '',
        classroom_id: classroom?.id || '',
        caregiver: caregiver?.name || '',
        caregiver_id: caregiver?.id || '',
        community: caregiver?.community || "",
        phone: caregiver?.phone || "",
        caregiver_gender: caregiver?.gender || "",
        qualification: caregiver?.qualification || "",
        employment: caregiver?.employment || "",

    }
}



export const basicBaneDetails = (beneficiary: any) => {

    const { id, first_name,
        last_name,
        middle_name } = beneficiary;
    const name = `${first_name} ${last_name} ${middle_name}`;
    return {
        id,
        name,
    }
}